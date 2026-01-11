import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router'; 
import App from './App';
import RoomMonitor from './RoomMonitor';
import History from "./History";
import Analysis from "./Analysis";
import './index.css';


const root = document.getElementById('root');

render(
  () => (
    //Tampilin halaman app.jsx
    <Router root={App}>
      <Route path="/history" component={History} />

      <Route path="/analysis" component={Analysis} />
      
      {/*kalo path nya / bakal tampilin kata kata pilih ruangan*/}
      <Route path="/" component={() => <div style="text-align:center; margin-top:50px;">Silakan Pilih Ruangan</div>} />
      {/*kalo path nya /RO1 atau /R02  bakal tampilin chart di ruangan tersebut*/}
      <Route path="/:id" component={RoomMonitor} />
    </Router>
  ),
  root
);