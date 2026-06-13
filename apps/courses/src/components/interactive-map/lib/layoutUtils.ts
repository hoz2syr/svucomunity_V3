import dagre from 'dagre';
import { Node, Edge, Position } from '@xyflow/react';
import { iteData } from '../data/ite_data';
import type { SpecializationCourse, Course } from '../types';
import { NODE_WIDTH, NODE_HEIGHT } from './constants';

// Memory guard: layout cache is unbounded without limits. Large ITE datasets
// can create many unique specialization combinations. Enforce a FIFO cap so
// old entries are evicted before memory grows without bound.
const layoutCache = new Map<string, { nodes: Node[]; edges: Edge[] }>();
const MAX_LAYOUT_CACHE_SIZE = 50;

export function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'RL') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const isHorizontal = direction === 'LR' || direction === 'RL';
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
      targetPosition: isHorizontal
        ? direction === 'LR'
          ? Position.Left
          : Position.Right
        : direction === 'TB'
          ? Position.Top
          : Position.Bottom,
      sourcePosition: isHorizontal
        ? direction === 'LR'
          ? Position.Right
          : Position.Left
        : direction === 'TB'
          ? Position.Bottom
          : Position.Top,
    };
  });

  return { nodes: layoutedNodes, edges };
}

export function generateInitialElements(selectedSpecialization: string | null) {
  const cacheKey = selectedSpecialization ?? 'none';

  if (layoutCache.has(cacheKey)) {
    return layoutCache.get(cacheKey)!;
  }

  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];
  const seenCodes = new Set<string>();

  const addCourseNode = (code: string, _nameAr: string, data: Course | SpecializationCourse) => {
    if (seenCodes.has(code)) return;
    seenCodes.add(code);
  return {
      id: code,
      type: 'courseNode',
      position: { x: 0, y: 0 },
      data: { course: data },
    };
  };

  const addPrereqEdges = (prereqs: string[], code: string) => {
    prereqs.forEach((prereq) => {
      initialEdges.push({
        id: `e-${prereq}-${code}`,
        source: prereq,
        target: code,
        type: 'smoothstep',
        animated: false,
      });
    });
  };

  Object.values(iteData.courses).forEach((course) => {
    addCourseNode(course.code, course.name_ar, course as Course);
    addPrereqEdges(course.prereqs, course.code);
  });

  if (selectedSpecialization) {
    const spec = iteData.specializations.find((s) => s.id === selectedSpecialization);
    if (spec) {
      const specCourses = iteData.specialization_courses[selectedSpecialization as keyof typeof iteData.specialization_courses];
      if (specCourses) {
        Object.values(specCourses.tracks).forEach((track) => {
          Object.values(track.courses).forEach((course) => {
            addCourseNode(course.code, course.name_ar, course as SpecializationCourse);
            addPrereqEdges(course.prereqs, course.code);
          });
        });
      }
    }
  }

  const result = getLayoutedElements(initialNodes, initialEdges, 'RL');
  layoutCache.set(cacheKey, result);
  if (layoutCache.size > MAX_LAYOUT_CACHE_SIZE) {
    const oldestKey = layoutCache.keys().next().value;
    if (oldestKey) layoutCache.delete(oldestKey);
  }
  return result;
}
