export const hoverLift = {
  rest: { scale: 1, y: 0, boxShadow: '0 8px 20px rgba(0,0,0,0.2)' },
  hover: { scale: 1.03, y: -4, boxShadow: '0 16px 36px rgba(46,230,255,0.22)' }
};

export const cardReveal = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45 } }
};
