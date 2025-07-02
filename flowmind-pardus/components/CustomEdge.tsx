import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from 'reactflow';
import { XCircle } from 'lucide-react';

export const CustomEdge: React.FC<EdgeProps> = (props) => {
  const { id, sourceX, sourceY, targetX, targetY, style, markerEnd, selected, data } = props;
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{ position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`, pointerEvents: 'all', zIndex: 10 }}
        >
          {selected && (
            <button
              onClick={() => data?.onDelete?.(id)}
              className="bg-red-600 hover:bg-red-500 text-white rounded-full p-1 shadow border border-white"
              title="Bağlantıyı Sil"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
