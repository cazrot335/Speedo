const createColoredMarker = (color) => {
    const canvas = document.createElement("canvas");
    const size = 20;
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
  
    context.beginPath();
    context.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI, false);
    context.fillStyle = color;
    context.fill();
  
    return canvas.toDataURL();
  };
  
  export default createColoredMarker;
  