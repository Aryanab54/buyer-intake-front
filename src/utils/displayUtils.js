// Map backend enum values to user-friendly display values
export const formatTimeline = (timeline) => {
  const timelineMap = {
    'ZERO_TO_THREE_MONTHS': '0-3 months',
    'THREE_TO_SIX_MONTHS': '3-6 months', 
    'MORE_THAN_SIX_MONTHS': '6+ months',
    'Exploring': 'Exploring'
  };
  
  return timelineMap[timeline] || timeline;
};

export const formatStatus = (status) => {
  const statusMap = {
    'NEW': 'New'
  };
  
  return statusMap[status] || status;
};

export const formatSource = (source) => {
  const sourceMap = {
    'Walk_in': 'Walk-in'
  };
  
  return sourceMap[source] || source;
};