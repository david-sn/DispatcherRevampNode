var rp = require('request-promise')
var Twitter = require('twitter');
let { secret } = require('../config/secret');
const { BitlyClient } = require('bitly');
const bitly1 = new BitlyClient(secret.bitly[0], {});
const bitly2 = new BitlyClient(secret.bitly[1], {});


module.exports.doServerlt = async function (req, res) {
    console.log("*******From Portal", req.body);

    let title = req.body.title;
    let categoryId = req.body.oldCategoryId;
    let cid = req.body.categoryId;
    let articleId = req.body.articleId;
    let mappedArticleId = req.body.mappedArticleId;
    let sendToTwitter = req.body.IsTwitter;
    let isAndroid = req.body.IsAndroid;
    let isIphone = req.body.IsIphone;
    let version = req.body.Version || "0";
    let isAdv = req.body.IsAdvertisment;
    let isBreaking = req.body.IsBreaking;


    //PUSH IOS
    if (isIphone && (isIphone == true || isIphone == "true" || isIphone == "True")) {
        console.log("************IPHONE IS ON***************");
        // OLD iOS  PUSH NOTIFICATION
        let iosPusher = {
            title: title,
            categoryId: categoryId,
            articleId: mappedArticleId,
            collapse_key: categoryId,
            platform: "IOS"
        }
        //     sendRequest('http://www.derwaza-news.net:8855/INNOVIPushServer/PushN', 'POST', iosPusher);//java


        // NEW iOS PUSH NOTIFICATION
        let newiOSPusher = {
            title: title,
            nid: articleId,
            version: version,

            categoryId: cid,
            articleId: articleId,
            isAdv: isAdv,
            isBr: isBreaking,
            collapse_key: categoryId,
            platform: "IOS"
        };

        //console.log("BEFORE QUERY PARAMETER")
        /*      rp({
                  uri: 'http://www.derwaza-news.net:8811/Push',
                  qs: {
                      title: title,
                      nid: articleId,
                      version: version,
                      categoryId: cid,
                      articleId: articleId,
                      isAdv: isAdv,
                      isBr: isBreaking,
                      collapse_key: categoryId,
                      platform: "IOS"
                  }
              }).then(function (repos) {
                  console.log("query Param Rsult ",repos);
              }).catch(function (err) {
                  console.log("ERROR ", err)
              });
      */
        sendRequest('http://derwaza-news.net:8844/sendFCM', 'POST', newiOSPusher);//node

    }//end IPHONE

    //  ANDROID PUSH NOTIFICATION
    if (isAndroid && (isAndroid == true || isAndroid == "true" || isAndroid == "True")) {
        console.log("************ANDROID IS ON***************");

        let titleBase64 = new Buffer(req.body.title);

        let androidPusher = {
            title: titleBase64.toString('base64'),
            nid: articleId,
            version: version,
            collapse_key: categoryId,
            catgeoryId: categoryId,
            categoryId: categoryId,
            cid: cid,
            articleId: mappedArticleId,
            isAdv: isAdv,
            isBr: isBreaking,
            platform: "ANDROID"
        }
        sendRequest('http://derwaza-news.net:8844/sendFCM', 'POST', androidPusher);//node
        // sendRequest('http://derwaza-news.net:8866/AndroidPNServerProvider/PushN', 'POST', androidPusher);//java
    }

    if (sendToTwitter && (sendToTwitter == true || sendToTwitter == "true" || sendToTwitter == "True")) {
        console.log("************TWITTER IS ON***************");

        let articleLink = "http://derwaza.cc/article/" + articleId;
        let result;
        if (new Date().getDate() <= 15) {
            result = await bitly1.shorten(articleLink);
        } else {
            result = await bitly2.shorten(articleLink);
        }

        let maxlenght = 138 - result.url.length - 1;
        let aTitle = title.substring(0, Math.min(maxlenght, title.length));
        aTitle += ".." + result.url;

        var client = new Twitter(secret.twitter);
        console.log("before Twitter");
        client.post('statuses/update', { status: aTitle }, function (error, tweet, response) {
            if (error) { console.log("ERROR", error) };
            console.log("*********TWITTER***SUCCESS********", tweet.id)
        });

    }
    res.status(200).json({ status: "OK" });
}


function sendRequest(uri, method, body) {
    rp({ uri, body, method, json: true })
        .then(function (repos) {
            console.log(uri);
            console.log(repos);
        }).catch(function (err) {
            console.log(uri);
            console.log(err);
        });
}