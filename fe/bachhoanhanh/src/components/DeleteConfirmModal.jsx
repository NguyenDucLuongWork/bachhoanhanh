export function DeleteConfirmModal({ isOpen, onClose, onConfirm, isLoading }) {
  if (!isOpen) return null

  return (
    <div className="modal-bg open">
      <div className="modal">
        <h3>Delete product?</h3>
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>This action cannot be undone.</p>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={isLoading}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
