// Suppress React defaultProps warnings from third-party libraries
// Run immediately when loaded
const originalWarn = console.warn;
const originalError = console.error;
  
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
       message.includes('ResponsiveContainer') ||
       message.includes('ReferenceLine') ||
       message.includes('ReferenceDot') ||
       message.includes('BarChart') ||
       message.includes('LineChart') ||
       message.includes('AreaChart') ||
       message.includes('PieChart') ||
       message.includes('ScatterChart') ||
       message.includes('ComposedChart') ||
       message.includes('Recharts'))
    ) {
      return;
    }
    
    // Suppress React 18 warnings about defaultProps
    if (message.includes('Support for defaultProps will be removed from function components')) {
      return;
    }
    
    // Suppress webpack cache warnings
    if (message.includes('webpack.cache.PackFileCacheStrategy') || 
        message.includes('Caching failed')) {
      return;
    }
    
    // Suppress Next.js hydration warnings for development
    if (message.includes('Extra attributes from the server') ||
        message.includes('data-sharkid') ||
        message.includes('data-ad-block') ||
        message.includes('data-extension') ||
        (message.includes('Prop `') && message.includes('did not match'))) {
      return;
    }
    
    // Call original console.warn for all other warnings
    originalWarn.apply(console, args);
  };
  
  console.error = (...args) => {
    const message = args.join(' ');
    
    // Suppress React 18 defaultProps errors
    if (message.includes('Support for defaultProps will be removed from function components')) {
      return;
    }
    
    // Suppress hydration warnings
    if (message.includes('Extra attributes from the server') ||
        message.includes('data-sharkid') ||
        message.includes('data-ad-block') ||
        message.includes('data-extension') ||
        message.includes('at select') ||
        message.includes('Warning: Prop')) {
      return;
    }
    
    // Call original console.error for all other errors
    originalError.apply(console, args);
  };