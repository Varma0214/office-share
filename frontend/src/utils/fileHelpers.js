export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const getFileIcon = (fileType, category) => {
  if (fileType?.includes('pdf') || category === 'pdf') return '📄';
  if (fileType?.includes('word') || fileType?.includes('document') || category === 'document') return '📝';
  if (fileType?.includes('presentation') || fileType?.includes('powerpoint') || category === 'presentation') return '📊';
  if (fileType?.includes('sheet') || fileType?.includes('excel') || category === 'spreadsheet') return '📈';
  if (fileType?.includes('image') || category === 'image') return '🖼️';
  if (fileType?.includes('zip') || fileType?.includes('compressed')) return '📦';
  if (fileType?.includes('text')) return '📃';
  return '📁';
};

export const getCategoryColor = (category) => {
  const colors = {
    pdf: '#e74c3c',
    document: '#3498db',
    presentation: '#e67e22',
    spreadsheet: '#27ae60',
    image: '#9b59b6',
    other: '#95a5a6'
  };
  return colors[category] || colors.other;
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};
