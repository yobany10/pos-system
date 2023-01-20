import { useEffect } from "react";

const useOutsideClick = (ref, callback) => {
  const handleClick = e => {
    // if click was not on dropdown menu
    if (ref.current && !ref.current.contains(e.target)) {
        callback()
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  });
};

export default useOutsideClick;