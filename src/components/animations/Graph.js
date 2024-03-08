import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import ForceGraph3D from 'react-force-graph-3d';
import '../../styles.css';

const Graph = () => {
    const numNodes = 40;
    const nodes = Array.from({ length: numNodes }, (_, i) => ({
        id: `node${i}`,
        name: `Node ${i}`,
        group: Math.floor(Math.random() * 3) + 1
    }));

    const links = [];
    for (let i = 0; i < numNodes; i++) {
        for (let j = i + 1; j < numNodes; j++) {
            if (Math.random() < 0.2) { 
                links.push({ source: `node${i}`, target: `node${j}` });
            }
        }
    }

    const graphData = { nodes, links };

    const nodeObjectSize = 0.5;
    const graphRef = useRef();

    useEffect(() => {
        if (graphRef.current) {
            graphRef.current.cameraPosition({ x: 0, y: 0, z: 140 }); 
        }
    }, []);

    return (
        <div className='graph-container'>
            <div className='graph'>
                <ForceGraph3D
                    ref={graphRef}
                    graphData={graphData}
                    nodeAutoColorBy="group"
                    nodeThreeObject={node => {
                        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ color: node.color }));
                        sprite.scale.set(nodeObjectSize, nodeObjectSize, nodeObjectSize);
                        return sprite;
                    }}
                />
            </div>
        </div>
    );
};

export default Graph;