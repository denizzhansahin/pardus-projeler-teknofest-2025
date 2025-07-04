// TypeScript declaration for importing PNG files
// Allows import img from '../assets/Pardus-02.png';
declare module '*.png' {
  const value: string;
  export default value;
}
