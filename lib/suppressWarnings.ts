// Suppress React defaultProps warnings from third-party libraries
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  
  console.warn = (...args) => {
    const message = args.join(' ');
    
    // Suppress defaultProps warnings from Recharts components
    if (
      message.includes('Support for defaultProps will be removed from function components') &&
      (message.includes('XAxis') || 
       message.includes('YAxis') || 
       message.includes('CartesianGrid') ||
       message.includes('Tooltip') ||
       message.includes('Legend') ||
       message.includes('ResponsiveContainer'))
    ) {
      return;
    }
    
    // Call original console.warn for all other warnings
    originalWarn.apply(console, args);
  };
}