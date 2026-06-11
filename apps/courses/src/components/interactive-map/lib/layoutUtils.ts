import dagre from 'dagre';
import type { Node, Edge, Position } from '@xyflow/react';
import { iteData } from '../data/ite_data';
import type { SpecializationCourse, Course } from '../types';

export function getLayoutedElements(nodes: Node[], edges: Edge[], direction = 'RL') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  const nodeWidth = 220;
  const nodeHeight = 120;
  // matches CourseNode targetWidth/targetHeight

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
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
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
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
  const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [];

  const seenCodes = new Set<string>();

  const addCourseNode = (code: string, nameAr: string, data: Course | SpecializationCourse) => {
    if (seenCodes.has(code)) return;
    seenCodes.add(code);
    initialNodes.push({
      id: code,
      type: 'courseNode',
      position: { x: 0, y: 0 },
      data: { course: data },
    });
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

  return getLayoutedElements(initialNodes, initialEdges, 'RL');
}
