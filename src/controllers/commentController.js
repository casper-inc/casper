import { CommentService } from '../services';
import { Helpers } from '../utils';

const { errorResponse, successResponse } = Helpers;
const { createComment, deleteCommentById } = CommentService;


/**
 * A collection of methods that is used to carry CRUD operations for Comment
 * on the App.
 * @class CommentController
 */
export default class CommentController {
/**
   * Creates a new comment on a travel request.
   *
   * @static
   * @param {Request} req - The request from the endpoint.
   * @param {Response} res - The response returned by the method.
   * @returns { JSON } A JSON response containing details of the newly created comment.
   * @memberof CommentController
   */
  static async create(req, res) {
    try {
      const { data: { id }, body } = req;
      body.userId = id;
      const comment = await createComment(req, body);
      successResponse(res, comment, 201);
    } catch (err) {
      errorResponse(res, {});
    }
  }

  /**
   * Deletes a comment on a travel request.
   *
   * @static
   * @param {Request} req - The request from the endpoint.
   * @param {Response} res - The response returned by the method.
   * @returns { JSON } A JSON response containing with an empty data object.
   * @memberof CommentController
   */
  static async deleteComment(req, res) {
    try {
      const commentId = parseInt(req.params.commentId, 10);
      const rowDeleted = await deleteCommentById(commentId);
      if (!rowDeleted) return errorResponse(res, {});
      successResponse(res, { id: commentId }, 200);
    } catch (err) {
      errorResponse(res, {});
    }
  }
}
