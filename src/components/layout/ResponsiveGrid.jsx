export default function ResponsiveGrid({ children, cols = '1fr 300px', gap = '2rem', breakpoint = 768 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `min(${breakpoint}px, 100%) <= 100vw ? '1fr' : ${cols}`,
      gap,
      alignItems: 'start'
    }}>
      {children}
    </div>
  )
}
