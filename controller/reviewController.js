import { productModel, userModel } from "../models";
import { ErrorHandler, APIFeatures } from "../utils";

const reviewController = {
  // Create new Review or Update the review
  async CreateProductReview(req, res, next) {
    try {
      const { rating, comment, productId } = req.body;

      const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
      };

      const product = await productModel.findById(productId);
      // here it will check review user id is equal to login user id
      const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
      );
      if (isReviewed) {
        product.reviews.forEach((rev) => {
          if (rev.user.toString() === req.user._id.toString())
            (rev.rating = rating), (rev.comment = comment);
        });
      } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
      }

      let avg = 0;

      product.reviews.forEach((rev) => {
        // avg = avg + rev.rating
        avg += rev.rating;
      });
      console.log(avg);
      console.log(avg / product.reviews.length);
      product.ratings = avg / product.reviews.length;

      await product.save({ validateBeforeSave: false });

      res.status(200).json({
        success: true,
      });
    } catch (err) {
      return next(new ErrorHandler(err, 500));
    }
  },
  async GetProductReview(req, res, next) {
    try {
      const product = await productModel.findById(req.query.id);

      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      res.status(200).json({
        success: true,
        reviews: product.reviews,
      });
    } catch (err) {
      return next(new ErrorHandler(err, 500));
    }
  },
  async DeleteProductReview(req, res, next) {
    try {
      const product = await productModel.findById(req.query.productId);
      // console.log(`product Data:-`, product);
      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }

      const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
      );
      // console.log(`req.query.id Data:-`, req.query.id);

      let avg = 0;

      reviews.forEach((rev) => {
        avg += rev.rating;
      });

      let ratings = 0;
      console.log(reviews);
      if (reviews.length === 0) {
        ratings = 0;
      } else {
        ratings = avg / reviews.length;
      }

      const numOfReviews = reviews.length;

      await productModel.findByIdAndUpdate(
        req.query.productId,
        {
          reviews,
          ratings,
          numOfReviews,
        },
        {
          new: true,
          runValidators: true,
          useFindAndModify: false,
        }
      );

      res.status(200).json({
        success: true,
      });
    } catch (err) {
      return next(new ErrorHandler(err, 500));
    }
  },
};

export default reviewController;
