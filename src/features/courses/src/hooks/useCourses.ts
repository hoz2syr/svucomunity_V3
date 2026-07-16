import { useState, useCallback, useEffect, useRef } from 'react';
import type { CourseStatus } from '../types';
import { coursesDB, promotionThresholds } from '../data/coursesData';
import { useAuth } from '@/src/contexts/AuthContext';
import { fetchUserProgress, upsertUserProgress } from '../services/courses.service';
import { COURSE_CELEBRATION_DISPLAY_MS } from '@/src/lib/constants';

const PASSED_KEY = 'svu_courses_passed';
const CARRIED_KEY = 'svu_courses_carried';

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

export function useCourses() {
  const [passedCourses, setPassedCourses] = useState<string[]>(() => getFromStorage(PASSED_KEY, []));
  const [carriedCourses, setCarriedCourses] = useState<string[]>(() => getFromStorage(CARRIED_KEY, []));
  const [currentCart, setCurrentCart] = useState<string[]>([]);
  const [totalEarnedCredits, setTotalEarnedCredits] = useState(0);
  const [modal, setModal] = useState<{ title: string; content: string; isAlert?: boolean } | null>(null);
  const [celebration, setCelebration] = useState(false);
  const { session, envMissing } = useAuth();

  const passedRef = useRef(passedCourses);
  const carriedRef = useRef(carriedCourses);

  useEffect(() => {
    passedRef.current = passedCourses;
  }, [passedCourses]);

  useEffect(() => {
    carriedRef.current = carriedCourses;
  }, [carriedCourses]);

  const calculatePoints = useCallback((passed: string[]) => {
    return passed.reduce((sum, id) => {
      const course = coursesDB[id];
      return sum + (course ? (course.earned || course.credits) : 0);
    }, 0);
  }, []);

  useEffect(() => {
    if (!session?.user?.id || envMissing) return;
    let cancelled = false;
    fetchUserProgress(session.user.id).then((result) => {
      if (cancelled || result.error) return;
      const cloudPassed = result.data?.filter(p => p.status === 'passed').map(p => p.course_code) || [];
      const cloudCarried = result.data?.filter(p => p.status === 'carried').map(p => p.course_code) || [];
      if (cloudPassed.length > 0 || cloudCarried.length > 0) {
        setPassedCourses(cloudPassed);
        setCarriedCourses(cloudCarried);
        setToStorage(PASSED_KEY, cloudPassed);
        setToStorage(CARRIED_KEY, cloudCarried);
        setTotalEarnedCredits(calculatePoints(cloudPassed));
      }
    });
    return () => { cancelled = true; };
  }, [session?.user?.id, envMissing, calculatePoints]);

  const getYearFromCredits = useCallback((credits: number): string => {
    for (const threshold of promotionThresholds) {
      if (credits >= threshold.credits) return threshold.name;
    }
    return promotionThresholds[0].name;
  }, []);

  const getCourseStatus = useCallback(
    (courseId: string): CourseStatus => {
      const course = coursesDB[courseId];
      if (!course) return 'locked';

      if (passedRef.current.includes(courseId)) return 'passed';
      if (carriedRef.current.includes(courseId) && !currentCart.includes(courseId)) return 'carried';
      if (currentCart.includes(courseId)) return 'selected';

      const reqsMet = course.prereqs.every(
        req => passedRef.current.includes(req) || carriedRef.current.includes(req)
      );
      const hoursMet = course.minTotalCredits ? totalEarnedCredits >= course.minTotalCredits : true;
      if (reqsMet && hoursMet) return 'available';
      return 'locked';
    },
    [currentCart, totalEarnedCredits]
  );

  const currentSemesterHours = currentCart.reduce((sum, id) => {
    const course = coursesDB[id];
    return sum + (course ? course.credits : 0);
  }, 0);

  const toggleCourse = useCallback(
    (id: string) => {
      if (passedRef.current.includes(id)) {
        setModal({ title: 'تعديل حالة المادة', content: `المادة ${coursesDB[id]?.name} مرفّعة. هل تريد إزالتها؟`, isAlert: false });
        return;
      }
      if (carriedRef.current.includes(id) && !currentCart.includes(id)) {
        setModal({ title: 'تعديل حالة المادة', content: `المادة ${coursesDB[id]?.name} (حمل). هل قمت بترفيعها الآن؟`, isAlert: false });
        return;
      }

      const course = coursesDB[id];
      if (!course) return;

      const missingReqs = course.prereqs.filter(
        req => !passedRef.current.includes(req) && !carriedRef.current.includes(req)
      );
      const hoursMet = course.minTotalCredits ? totalEarnedCredits >= course.minTotalCredits : true;

      if (missingReqs.length > 0 || !hoursMet) {
        let err = '';
        if (missingReqs.length > 0) {
          err += `يجب تنزيل: ${missingReqs.map(r => coursesDB[r]?.name || r).join('، ')}\n\n`;
        }
        if (!hoursMet) err += `تحتاج لـ ${course.minTotalCredits} نقطة للفتح.`;
        setModal({ title: 'مادة مقفلة', content: err, isAlert: true });
        return;
      }

      setCurrentCart(prev => {
        if (prev.includes(id)) {
          return prev.filter(item => item !== id);
        }
        if (currentSemesterHours + course.credits > 36) {
          setModal({ title: 'تجاوز الحد', content: 'لا يمكن تجاوز 36 نقطة.', isAlert: true });
          return prev;
        }
        return [...prev, id];
      });
    },
    [currentCart, currentSemesterHours, totalEarnedCredits]
  );

  const openFinishModal = useCallback(() => {
    setModal({
      title: 'حالة مواد الفصل',
      content: 'اختر حالة كل مادة من الفصل الحالي',
      isAlert: false,
    });
  }, []);

  const saveSemesterData = useCallback(
    (statuses: Record<string, 'passed' | 'carried'>) => {
      const oldCredits = totalEarnedCredits;
      const newPassed = [...passedRef.current];
      const newCarried = [...carriedRef.current];

      currentCart.forEach(id => {
        if (statuses[id] === 'passed') {
          if (!newPassed.includes(id)) newPassed.push(id);
          newCarried.splice(newCarried.indexOf(id), 1);
        } else {
          if (!newCarried.includes(id)) newCarried.push(id);
          newPassed.splice(newPassed.indexOf(id), 1);
        }
      });

      setPassedCourses(newPassed);
      setCarriedCourses(newCarried);
      setToStorage(PASSED_KEY, newPassed);
      setToStorage(CARRIED_KEY, newCarried);
      setCurrentCart([]);

      const newCredits = calculatePoints(newPassed);
      setTotalEarnedCredits(newCredits);

      const oldYear = getYearFromCredits(oldCredits);
      const newYear = getYearFromCredits(newCredits);
      if (newYear !== oldYear && oldCredits < newCredits && oldCredits > 0) {
        setCelebration(true);
        setTimeout(() => setCelebration(false), COURSE_CELEBRATION_DISPLAY_MS);
      }

      setModal({ title: 'تم الحفظ!', content: 'تم تحديث سجل المواد بنجاح.', isAlert: true });

      if (session?.user?.id && !envMissing) {
        newPassed.forEach(code => upsertUserProgress(session.user.id, { course_code: code, status: 'passed' }));
        newCarried.forEach(code => upsertUserProgress(session.user.id, { course_code: code, status: 'carried' }));
      }
    },
    [calculatePoints, currentCart, getYearFromCredits, totalEarnedCredits, session, envMissing]
  );

  const convertToPassed = useCallback(
    (id: string) => {
      const newCarried = carriedRef.current.filter(x => x !== id);
      const newPassed = [...passedRef.current, id];
      setCarriedCourses(newCarried);
      setPassedCourses(newPassed);
      setToStorage(CARRIED_KEY, newCarried);
      setToStorage(PASSED_KEY, newPassed);
      setTotalEarnedCredits(calculatePoints(newPassed));
      setModal(null);
    },
    [calculatePoints]
  );

  const removeCourse = useCallback(
    (id: string) => {
      const newPassed = passedRef.current.filter(x => x !== id);
      const newCarried = carriedRef.current.filter(x => x !== id);
      setPassedCourses(newPassed);
      setCarriedCourses(newCarried);
      setToStorage(PASSED_KEY, newPassed);
      setToStorage(CARRIED_KEY, newCarried);
      setTotalEarnedCredits(calculatePoints(newPassed));
      setModal(null);
    },
    [calculatePoints]
  );

  const resetData = useCallback(() => {
    if (typeof window !== 'undefined' && window.confirm('هل أنت متأكد أنك تريد تصفير خطتك بالكامل والبدء من جديد؟')) {
      setPassedCourses([]);
      setCarriedCourses([]);
      setCurrentCart([]);
      setTotalEarnedCredits(0);
      localStorage.removeItem(PASSED_KEY);
      localStorage.removeItem(CARRIED_KEY);
    }
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  return {
    passedCourses,
    carriedCourses,
    currentCart,
    totalEarnedCredits,
    currentSemesterHours,
    modal,
    celebration,
    toggleCourse,
    openFinishModal,
    saveSemesterData,
    convertToPassed,
    removeCourse,
    resetData,
    closeModal,
    getCourseStatus,
    getYearFromCredits,
  };
}
