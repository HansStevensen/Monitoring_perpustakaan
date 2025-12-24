import "./RunningAlert.css";//import css nya

//runningAlert dipakai untuk menampilkan warning dalam bentuk teks berjalan
export default function RunningAlert(props) {
  
  //kalau props.message yang merupakan warning tidak ada,maka tidak perlu memunculkan si running alert
  if (!props.message) return null;

  return (
    <div class="running-alert-container">
      {/* Tag Marquee untuk efek jalan */}
      <marquee behavior="scroll" direction="left" scrollamount="20">
        {props.message}
      </marquee>
    </div>
  );
}