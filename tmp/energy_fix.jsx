  return (
    <group ref={coreRef}>
      {/* Outer core shell */}
      <mesh geometry={coreGeometry} material={coreMaterial} castShadow receiveShadow>
        <meshStandardMaterial attach="material" color={0x0a0a1a} metalness={0.9} roughness={0.1} clearcoat={1.0} clearcoatRoughness={0.1} transmission={0.3} thickness={0.5} ior={1.5} envMapIntensity={2.0} />
      </mesh>

      {/* Inner glowing core */}
      <mesh ref={innerCoreRef} geometry={coreGeometry} material={innerCoreMaterial} scale={0.6}>
        <meshBasicMaterial attach="material" color="#ff006e" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>

      {/* Particle field around core */}
      <points ref={particlesRef} geometry={particleGeometry} material={particleMaterial} />

      {/* Pulsing glow rings */}
      <group ref={ringsRef}>
        {[0, 1, 2].map(i => (
          <mesh key={i} geometry={new THREE.RingGeometry(5 + i * 2, 5.5 + i * 2, 64)} material={ringMaterial} rotation-x={-Math.PI / 2} rotation-y={i * Math.PI / 3} />
        ))}
      </group>
    </group>
  );
}
