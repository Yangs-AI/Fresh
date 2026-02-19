declare module '@site/static/statistics.json' {
  export interface FreshStats {
    miss: number;
    viss: number;
    algs: number;
    tabs: number;
    bibs: number;
    news: number;
  }
  const value: FreshStats;
  export default value;
}