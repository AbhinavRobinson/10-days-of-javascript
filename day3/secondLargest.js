function getSecondLargest(nums) {
  let sl = -2;
  let l = -1;
  nums.forEach((i) => (i > l ? (l = i) : l));
  nums.forEach((i) => (i > sl && i < l ? (sl = i) : sl));
  return sl;
}
