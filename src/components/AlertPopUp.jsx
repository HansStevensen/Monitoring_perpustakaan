import "./AlertPopUp.css";//import css 

function AlertPopUp(props) {
  return (
    <div class="alert-popup-overlay">
      <div class="alert-popup-box">
        
        <h3 class="alert-popup-title">Warning!!!</h3>
        
        <p class="alert-popup-message">
          {props.message}
        </p>
        
        <button 
          onClick={props.onClose}
          class="alert-popup-button"
        >
          Tutup & Cek Lokasi
        </button>

      </div>
    </div>
  );
}

export default AlertPopUp;