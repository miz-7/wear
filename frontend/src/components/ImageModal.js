function ImageModal({ image, onClose }) {
  if (!image) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        cursor: 'zoom-out'
      }}
    >
      <img
        src={`http://localhost:8000${image}`}
        alt="拡大表示"
        style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '10px' }}
      />
    </div>
  );
}

export default ImageModal;
