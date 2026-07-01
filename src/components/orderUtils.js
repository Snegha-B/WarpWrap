export const calculateCompletionDays = (totalYarns, bells, sections) => {
  const y = parseFloat(totalYarns) || 0;
  const bl = parseFloat(bells) || 0;
  const s = parseFloat(sections) || 0;
  
  const workUnits = y * bl * s;
  if (workUnits === 0) return "Select parameters";
  if (workUnits < 100000) return "1 Day";
  if (workUnits <= 300000) return "3 Days";
  return "5 Days";
};

export const calculateDelayRisk = (deliveryDateStr, progressPercent, status) => {
  if (status === 'Delivered' || status === 'Completed') {
    return { label: 'On Time', color: 'green', code: 'GREEN' };
  }

  const today = new Date("2026-06-18"); // Central system date
  const deliveryDate = new Date(deliveryDateStr);
  
  if (isNaN(deliveryDate.getTime())) {
    return { label: 'On Time', color: 'green', code: 'GREEN' };
  }

  const diffTime = deliveryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const progress = parseFloat(progressPercent) || 0;

  if (diffDays < 0) {
    return { label: 'High Delay Risk', color: 'red', code: 'RED', reason: 'Delivery date has already passed!' };
  }
  
  if (diffDays <= 1 && progress < 80) {
    return { label: 'High Delay Risk', color: 'red', code: 'RED', reason: 'Less than 24 hours left and progress is below 80%.' };
  }
  
  if (diffDays <= 3 && progress < 50) {
    return { label: 'Possible Delay', color: 'yellow', code: 'YELLOW', reason: 'Less than 3 days left and progress is below 50%.' };
  }

  return { label: 'On Time', color: 'green', code: 'GREEN' };
};

export const calculateWorkload = (orders) => {
  const activeOrdersCount = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Completed').length;
  
  if (activeOrdersCount < 3) {
    return { label: 'Low Workload', color: 'green', count: activeOrdersCount };
  } else if (activeOrdersCount <= 7) {
    return { label: 'Moderate Workload', color: 'yellow', count: activeOrdersCount };
  } else {
    return { label: 'Heavy Workload', color: 'red', count: activeOrdersCount };
  }
};
