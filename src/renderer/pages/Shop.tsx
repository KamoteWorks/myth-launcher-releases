/* eslint-disable */
import coinIcon from '../../../assets/img/coinlogo.png'
export default function Shop() {
  const items = [
    { id: 1, name: '50', free: '', price: 50, imageUrl:'https://i.imgur.com/tnPQwOf.png'},
    { id: 2, name: '100', free: '+ FREE 10', price: 100, imageUrl:'https://i.imgur.com/BblrQmN.png'},
    { id: 3, name: '200', free: '+ FREE 25',  price: 200, imageUrl:'https://i.imgur.com/TP8IpAT.png'},
    { id: 4, name: '500', free: '+ FREE 65',  price: 500, imageUrl:'https://i.imgur.com/ALMWBGC.png' },
    { id: 5, name: '1000', free: '+ FREE 140',  price: 1000, imageUrl:'https://i.imgur.com/wrerGXd.png' },
    { id: 6, name: '2000', free: '+ FREE 300',  price: 2000, imageUrl:'https://i.imgur.com/vjkBwYP.png' },
  ];

  return (
    <div className="shop-container floating-effect">
      <div className="item-grid">
        {items.map(item => (
          <div key={item.id} className="item-card">
            <p className='item-label'><img src={coinIcon} alt="" width={30}/> {item.name}<span> {item.free}</span></p>
            <img src={item.imageUrl} alt="" className="item-image" draggable="false"/>
            <br />
            <button className="item-button">₱{item.price}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
