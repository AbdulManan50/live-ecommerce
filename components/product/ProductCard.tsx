export default function ProductCard({product}:any){

return(

<div className="border rounded-xl p-4">

<img src={product.images?.[0]} />

<h3>{product.title}</h3>

<p>${product.price}</p>

<button className="bg-black text-white px-4 py-2">

Buy Now

</button>

</div>

)

}