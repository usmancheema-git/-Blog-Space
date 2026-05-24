import { asyncHandler } from "../utils/asyncHandler.js"
import { Article } from "../models/Article.schema.js";
import { User } from "../models/User.schema.js";


const createArticle = asyncHandler(async (req, res) => {
    const { title, content } = req.body;

    if (!req.user) {
        return res.status(401).json({ msg: ' Unauthorized: User not found' });
    }

    const article = await Article.create({
        title: title,
        content: content,
        createdBy: req.user._id
    });

    if (!article) {
        return res.status(400).json({ msg: ' Cannot create article' });
    }

    return res.status(200).json({ msg: " Article created successfully", article });
});

const getArticle = asyncHandler(async (req, res) => {
    const articles = await Article.find().sort({ createdAt: -1 });

    if (!articles || articles.length === 0) {
        return res.status(404).json({ msg: ' No articles found' });
    }

    return res.status(200).json({ msg: articles });
});


const getSingleArticle = asyncHandler(async (req, res) => {

    const { title } = req.params;

    if (!title) {
        return res.status(400).json({ msg: 'Article title required' });
    }

    const article = await Article.findOne({ title });

    if (!article) {
        return res.status(404).json({ msg: 'Article not found' });
    }

    return res.status(200).json({ msg: article });
});


const deleteArticle = asyncHandler(async (req, res) => {

    const { articleId } = req.params;

    const article = await Article.findOneAndDelete({
        _id: articleId,
        createdBy: req.user._id
    });

    if (!article) {
        return res.status(404).json({ msg: ' Article not found' });
    }


    if (!article.createdBy.equals(req.user._id)) return res.status(403).json({ msg: ' Unauthorized access ' });


    if (article.deletedCount === 0) {
        return res.status(500).json({ msg: " can't delete article" });
    }


    return res.status(200).json({ msg: 'Article deleted successfuly ' });



})


const updateArticle = asyncHandler(async (req, res) => {

    // check id 
    const { articleId } = req.params;
    const { content, title } = req.body;  // get it from frontend in the shape of forms etc .. 


    if (!articleId) {
        return res.status(400).json({ msg: ' article  not found' })
    }

    const article = await Article.findById(articleId);  // this will retun full document 

    if (!article) return res.status(404).json({ msg: ' Article not found' });

    // // check ownership 
    if (!article.createdBy.equals(req.user._id)) return res.status(403).json({ msg: ' Unauthorized access ' });

    // Perform partial update
    if (title) article.title = title;
    if (content) article.content = content;

    await article.save();

    return res.status(200).json({ msg: "Article updated successfully", article });


})


const getPlatformStats = asyncHandler(async (req, res) => {
    const stats = await Article.aggregate([
        {
            $facet: {
                totalArticles: [
                    { $count: 'count' }
                ],


                totalUsers: [
                    {
                        $lookup: {
                            from: "users",
                            pipeline: [{ $count: 'count' }],
                            as: 'userCount'
                        }
                    }
                ]


            }
        }
    ]
    )
    const totalArticles = stats[0]?.totalArticles[0]?.count || 0
    const totalUsers = stats[0]?.totalUsers[0]?.userCount[0]?.count || 0

    return res.status(200).json({
        articles: totalArticles,
        users: totalUsers,
        uptime: "99.9%"
    });

});


const serachArticle = asyncHandler(async (req, res)=>{

    const {query} = req.query;

    if (!query || query == "" || query == null) return res.status(401).json({ msg: 'quey parameter missing' });
    
    const searchResult = await Article.aggregate([
  {
    $match: {
      title: query
    }
  },
  {
    $sort: {
      title: -1   
    }
  },
  {
    $project: {
      _id :0,
      title :1,
			content: 1,
			createdBy : 1	,
      createdAt :1
    }
  }
])

    return res.json({msg:'searchArticele',
        sr
    });


});

export {
    createArticle,
    getArticle,
    getSingleArticle,
    deleteArticle,
    updateArticle,
    getPlatformStats,
    serachArticle
};