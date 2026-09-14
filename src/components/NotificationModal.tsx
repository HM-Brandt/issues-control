import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { MdCheckCircle, MdError } from "react-icons/md";

export interface NotificationState {
  show: boolean;
  type: "success" | "error" | "info" | "warning"; // 👈 Soportamos todos los tipos
  title: string;
  message: string;
}

interface NotificationModalProps {
  notification: NotificationState;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  onClose,
}) => {
  const { show, type, title, message } = notification;

  useEffect(() => {
    if (show && type === "success") {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, type]); // Removido onClose para evitar cierres prematuros

  if (!show) return null;

  const isSuccess = type === "success";

  return ReactDOM.createPortal(
    <div
      className="position-fixed top-0 end-0 p-3"
      style={{ zIndex: 1060, maxWidth: "420px", width: "100%" }}
    >
      <div
        className={`toast show align-items-center border-0 shadow-lg text-white ${
          isSuccess ? "bg-success" : "bg-danger"
        }`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="d-flex p-3 align-items-start">
          {/* Icono */}
          <div className="me-3 fs-4 d-flex align-items-center">
            {isSuccess ? <MdCheckCircle /> : <MdError />}
          </div>

          {/* Texto */}
          <div className="toast-body p-0 flex-grow-1">
            <h6 className="mb-1 fw-bold">{title}</h6>
            <p className="mb-0 small opacity-90">{message}</p>
          </div>

          {/* Botón Cerrar */}
          <button
            type="button"
            className="btn-close btn-close-white ms-2"
            aria-label="Close"
            onClick={onClose}
          ></button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
