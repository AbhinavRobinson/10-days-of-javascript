function getCount(objects) {
  return objects.reduce((total, currObj) => {
    return currObj.x == currObj.y ? (total += 1) : total;
  }, 0);
}
