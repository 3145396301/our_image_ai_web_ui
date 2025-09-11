import json from "/src/url.json";
let userBaseUrl = json.serviceUri.user.protocol + "://" + json.serviceUri.user.serverHost + ":" + json.serviceUri.user.port + json.serviceUri.user.context;
let aiImageBaseUrl =    json.serviceUri.aiImage.protocol + "://" + json.serviceUri.aiImage.serverHost + ":" + json.serviceUri.aiImage.port + json.serviceUri.aiImage.context;
let settingBaseUrl = json.serviceUri.setting.protocol + "://" + json.serviceUri.setting.serverHost + ":" + json.serviceUri.setting.port + json.serviceUri.setting.context;
let userImageBaseUrl = json.serviceUri.userImage.protocol + "://" + json.serviceUri.userImage.serverHost + ":" + json.serviceUri.userImage.port + json.serviceUri.userImage.context;
let shareBaseUrl = json.serviceUri.share.protocol + "://" + json.serviceUri.share.serverHost + ":" + json.serviceUri.share.port + json.serviceUri.share.context;
let activityBaseUrl = json.serviceUri.activity.protocol + "://" + json.serviceUri.activity.serverHost + ":" + json.serviceUri.activity.port + json.serviceUri.activity.context;
let payBaseUrl = json.serviceUri.pay.protocol + "://" + json.serviceUri.pay.serverHost + ":" + json.serviceUri.pay.port + json.serviceUri.pay.context;
if (json.proxy===true){
    userBaseUrl = json.serviceUri.user.proxyPrefix+json.serviceUri.user.context;
    aiImageBaseUrl = json.serviceUri.aiImage.proxyPrefix+json.serviceUri.aiImage.context;
    settingBaseUrl = json.serviceUri.setting.proxyPrefix+json.serviceUri.setting.context;
    userImageBaseUrl = json.serviceUri.userImage.proxyPrefix+json.serviceUri.userImage.context;
    shareBaseUrl = json.serviceUri.share.proxyPrefix+json.serviceUri.share.context;
    activityBaseUrl = json.serviceUri.activity.proxyPrefix+json.serviceUri.activity.context;
    payBaseUrl = json.serviceUri.pay.proxyPrefix+json.serviceUri.pay.context;
}
let urlObj = {
    user: {
        login: userBaseUrl + json.serviceUri.user.login,
        register: userBaseUrl + json.serviceUri.user.register,
        logout: userBaseUrl + json.serviceUri.user.logout,
        sendSMS: userBaseUrl + json.serviceUri.user.sendSMS,
        checkUsername: userBaseUrl + json.serviceUri.user.checkUsername,
        getUserInfo: userBaseUrl + json.serviceUri.user.getUserInfo,
        signIn: userBaseUrl + json.serviceUri.user.signIn,
        genVerificationCode: userBaseUrl+json.serviceUri.user.genVerificationCode,
        checkVerificationCode: userBaseUrl+json.serviceUri.user.checkVerificationCode,
    },
    aiImage: {
        texttoimage: aiImageBaseUrl + json.serviceUri.aiImage.texttoimage,
        imagetoimage: aiImageBaseUrl + json.serviceUri.aiImage.imagetoimage,
        progress: aiImageBaseUrl + json.serviceUri.aiImage.progress,
        recentlyGenerated: aiImageBaseUrl + json.serviceUri.aiImage.recentlyGenerated
    },
    setting: {
        modelList: settingBaseUrl + json.serviceUri.setting.modelList,
        samplerList: settingBaseUrl + json.serviceUri.setting.samplerList,
        loraList: settingBaseUrl +json.serviceUri.setting.loraList,
        currentModel: settingBaseUrl + json.serviceUri.setting.currentModel,
        updateModel: settingBaseUrl + json.serviceUri.setting.updateModel,
        loraInfo: settingBaseUrl + json.serviceUri.setting.loraInfo,
    },
    userImage: {
        imageInfo: userImageBaseUrl + json.serviceUri.userImage.imageInfo,
        deleteImage: userImageBaseUrl + json.serviceUri.userImage.deleteImage,
        imageHistory: userImageBaseUrl + json.serviceUri.userImage.imageHistory,
        imageUrl: userImageBaseUrl + json.serviceUri.userImage.imageUrl
    },
    share: {
        shareImage: shareBaseUrl + json.serviceUri.share.shareImage
    },
    activity: {

    },
    pay: {
        pay: payBaseUrl + json.serviceUri.pay.pay,
        payLevels: payBaseUrl + json.serviceUri.pay.payLevels,
    }

};
export default urlObj;