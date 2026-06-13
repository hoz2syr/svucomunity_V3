export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface ScheduleTranslations {
  nav: {
    uploadSchedule: string;
    matchedGroups: string;
  };
  landing: {
    title: string;
    subtitle: string;
    feature1: string;
    feature1Desc: string;
    feature2: string;
    feature2Desc: string;
    feature3: string;
    feature3Desc: string;
    cta: string;
  };
  upload: {
    title: string;
    subtitle: string;
    dropText: string;
    dropHint: string;
    clearImage: string;
    extractBtn: string;
    extracting: string;
    processing: string;
    error: string;
    apiKeyMissing: string;
    invalidFileType: string;
    fileTooLarge: string;
    previewAlt: string;
  };
  auth: {
    login: string;
    loginWithGoogle: string;
    loggingIn: string;
    googleError: string;
    loginRequired: string;
  };
  results: {
    title: string;
    noCourses: string;
    major: string;
    section: string;
    instructor: string;
    time: string;
    matchedGroups: string;
    allGroups: string;
    noGroupsForCourse: string;
    noGroupsFound: string;
    loadMore: string;
    loading: string;
    join: string;
    leave: string;
    joined: string;
    createGroup: string;
    createGroupTitle: string;
    groupName: string;
    createBtn: string;
    creating: string;
    groupCreated: string;
    members: string;
    maxMembers: string;
    course: string;
    code: string;
    full: string;
    reupload: string;
    retry: string;
  };
  tabs: {
    upload: string;
    matchedGroups: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    confirm: string;
    close: string;
    save: string;
    delete: string;
    edit: string;
    search: string;
    noResults: string;
    back: string;
    next: string;
    previous: string;
  };
}

export interface I18nState {
  lang: Language;
  dir: Direction;
}

export interface I18nAPI {
  state: I18nState;
  setLang: (lang: Language) => void;
  toggleLang: () => Language;
  t: (key: string, fallback?: string) => string;
}

export type ScheduleDictionary = {
  [K in keyof ScheduleTranslations]: ScheduleTranslations[K];
};
