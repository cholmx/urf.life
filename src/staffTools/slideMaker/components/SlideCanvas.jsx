import React, { useEffect, useRef, useImperativeHandle } from 'react';
import { render } from '../utils/renderEngine';

const SlideCanvas = React.forwardRef(({ tmplId, data, brand, bgImg, accentImg, ov, blur, canvasW, canvasH, cornerR = 32, style }, forwardedRef) => {
  const internalRef = useRef(null);

  useImperativeHandle(forwardedRef, () => internalRef.current);

  useEffect(() => {
    if (internalRef.current) {
      render(internalRef.current, tmplId, data, brand, bgImg, accentImg, ov, blur, canvasW, canvasH, cornerR);
    }
  }, [tmplId, data, brand, bgImg, accentImg, ov, blur, canvasW, canvasH, cornerR]);

  return (
    <canvas 
      ref={internalRef} 
      style={{ width: "100%", height: "auto", display: "block", borderRadius: 8, ...style }} 
    />
  );
});

export default SlideCanvas;