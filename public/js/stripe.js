/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';


const stripe = Stripe('pk_test_51N1PJfIy6ZDingCOrRjJKV7Np2Yxw4OgStefeX1LQa5soCvC3t2CDfppkElrmRoRnnrXLFgm9WK8JrdX4ILFAoXN009azc5Kqm')

export const bookTour =  async tourId =>{
  try{
    // get checkout session from api
  const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`)

  console.log(session)
  // create checkout form plus charge to credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });

  }catch(err){
    console.log(err);
    showAlert('error', err)
  }
  
};