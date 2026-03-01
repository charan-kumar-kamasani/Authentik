let activeCount = 0;
const subscribers = new Set();

const notify = () => {
  for (const s of subscribers) s(activeCount);
};

const start = () => {
  activeCount += 1;
  notify();
};

const stop = () => {
  activeCount = Math.max(0, activeCount - 1);
  notify();
};

const getCount = () => activeCount;

const subscribe = (cb) => {
  subscribers.add(cb);
  cb(activeCount);
  return () => subscribers.delete(cb);
};

export default {
  start,
  stop,
  getCount,
  subscribe,
};
