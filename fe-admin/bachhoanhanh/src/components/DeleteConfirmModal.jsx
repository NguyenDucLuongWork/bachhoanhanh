export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading,
  title = 'Delete product?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  closeText = 'Cancel',
  isDanger = true
}) {
  if (!isOpen) return null

  return (
    <div className="modal-bg open">
      <div className="modal">
        <h3>{title}</h3>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{message}</p>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>
            {closeText}
          </button>
          <button 
            className={isDanger ? 'btn btn-danger' : 'btn'} 
            onClick={onConfirm} 
            disabled={isLoading}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
