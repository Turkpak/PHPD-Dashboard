const _jsxFileName = "";
import React from "react";
import { useEffect, useState } from "react";

export function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash screen for 1 second
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 300); // Wait for fade out animation
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    React.createElement('div', {
      className: `fixed inset-0 z-50 flex items-center justify-center bg-background transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`, __self: this, __source: {fileName: _jsxFileName, lineNumber: 19}}

      , React.createElement('div', { className: "relative flex items-center justify-center w-64 h-64"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 24}}
        /* Logo */
        , React.createElement('div', { className: "relative z-10 flex items-center justify-center"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 69}}
          , React.createElement('img', {
            src: "/Assets/PHPD.png",
            alt: "PHPD Logo" ,
            className: "h-56 w-56 object-contain animate-heartbeat"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 70}}
          )
        )
      )
    )
  );
}

