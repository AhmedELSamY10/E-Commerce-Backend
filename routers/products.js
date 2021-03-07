const router = new express.Router();
const Product = require("../models/products");


///api to create new product
router.post('/',upload.single('image'),async (req,res)=>{
    try {
        const {name,description,category ,brand,numberInStock,price} = req.body
        const img = {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
        if(name && img && category && brand && numberInStock && price){
            let product;

            if(description && description !== 'null')
                product = await Product.create({name,img,description,category ,brand,numberInStock,price ,totalRating:1})
            else
                product = await Product.create({name,img,category,brand,numberInStock,price,totalRating:1})

            const obj = {
                success:true,
                message:"product was created succesfully",
                product: product
            }
            res.send(obj)
        }else throw new Error("name, image ,category ,brand,numberInStock and price are required")
    } catch (err) {
        res.json({success:false,message:err.message})
    }
})

///MANIPULATE product with ID
router.route('/:id')
.delete(async(req, res) => {  ///delete product
   try {
       const {id} = req.params;
       const product = await Product.findOneAndDelete({_id:id})
       const obj = {
           success:true,
           message:(product)? "product deleted successfully": "product not found"
       }
       res.send(obj)
   } catch (err) {
       res.json({success:false,message:err.message})
   } 
})
.patch(upload.single('image'),async(req, res) => {  ///edit product
   try {
       const {id} = req.params;
       const {name,description,category ,brand,numberInStock,price} = req.body
        const img = {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
       const product = await Product.findOneAndUpdate({ _id: id }, {name,description,category ,brand,numberInStock,price},{returnOriginal: false})
       const obj = {
           success:true,
           message:(product)? "product edited successfully": "product not found",
           todo:todo
       }
       res.send(obj);
   } catch (err) {
       res.json({success:false,message:err.message})
   }      
})


///MANIPULATE product rating
router.route('/:id')
.patch(async(req, res) => {  ///delete rating
   try {
       const {id} = req.params;
       const ratingValue = req.query
       const userId = req.signedData;
       const product = await Product.findOne({_id:id})
       const total = product.totalRating
       product.ratings.forEach(element => {
            if(element.user == userId){
                product.totalRating = (total*2) - element.rating;  ///delete old rating from total rating
                element.rating = ratingValue;
                product.totalRating = (total+ratingValue)/2;  ///update total rating with new rating
                break;
            }
       });
       await product.save();
       const obj = {
           success:true,
           message:(product)? "product rating deleted successfully": "rating not found"
       }
       res.send(obj)
   } catch (err) {
       res.json({success:false,message:err.message})
   } 
})





module.exports = productsRouter;