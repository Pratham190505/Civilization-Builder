const { SchoolSocialAccount } = require('../models');
const logger = require('../config/logger');

// Base Provider Interface
class BaseSocialProvider {
  async connectAccount(credentials) {
    throw new Error('connectAccount() must be implemented');
  }

  async publishPost(mediaUrl, caption, token) {
    throw new Error('publishPost() must be implemented');
  }
}

// Instagram Provider Implementation
class InstagramProvider extends BaseSocialProvider {
  async connectAccount(credentials) {
    // Mock OAuth code token verification with Graph API
    logger.info('Connecting Instagram account with credentials: %o', credentials);
    return {
      external_account_id: 'ig_acc_' + Math.round(Math.random() * 1E9),
      account_handle: credentials.handle || 'gds_campus_instagram',
      profile_url: `https://instagram.com/${credentials.handle || 'gds_campus_instagram'}`,
      token_expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
    };
  }

  async publishPost(mediaUrl, caption, token) {
    logger.info('Publishing to Instagram (Mock API request). Media: %s, Caption: %s', mediaUrl, caption);
    return {
      success: true,
      postId: 'ig_post_' + Math.round(Math.random() * 1e9),
      postUrl: `https://instagram.com/p/mockpostid_${Math.round(Math.random() * 100)}`
    };
  }
}

// Facebook Provider Implementation
class FacebookProvider extends BaseSocialProvider {
  async connectAccount(credentials) {
    logger.info('Connecting Facebook Page with credentials: %o', credentials);
    return {
      external_account_id: 'fb_page_' + Math.round(Math.random() * 1E9),
      account_handle: credentials.handle || 'gds_campus_facebook',
      profile_url: `https://facebook.com/${credentials.handle || 'gds_campus_facebook'}`,
      token_expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
    };
  }

  async publishPost(mediaUrl, caption, token) {
    logger.info('Publishing to Facebook Page (Mock API request). Media: %s, Caption: %s', mediaUrl, caption);
    return {
      success: true,
      postId: 'fb_post_' + Math.round(Math.random() * 1e9),
      postUrl: `https://facebook.com/gds_campus/posts/mockpostid_${Math.round(Math.random() * 100)}`
    };
  }
}

class SocialMediaService {
  constructor() {
    this.providers = {
      INSTAGRAM: new InstagramProvider(),
      FACEBOOK: new FacebookProvider()
    };
  }

  getProvider(platform) {
    const provider = this.providers[platform.toUpperCase()];
    if (!provider) {
      throw new Error(`Social platform provider for ${platform} is not supported`);
    }
    return provider;
  }

  async linkAccount(schoolId, platform, credentials) {
    const provider = this.getProvider(platform);
    const details = await provider.connectAccount(credentials);

    // Update or create social account mapping
    const [account] = await SchoolSocialAccount.findOrCreate({
      where: { school_id: schoolId, platform: platform.toUpperCase() },
      defaults: {
        connection_status: 'CONNECTED',
        ...details
      }
    });

    await account.update({
      account_handle: details.account_handle,
      external_account_id: details.external_account_id,
      profile_url: details.profile_url,
      token_expiry_date: details.token_expiry_date,
      connection_status: 'CONNECTED'
    });

    return account;
  }

  async publishApprovedMedia(schoolId, platform, mediaUrl, caption) {
    const account = await SchoolSocialAccount.findOne({
      where: { school_id: schoolId, platform: platform.toUpperCase(), connection_status: 'CONNECTED' }
    });

    if (!account) {
      throw new Error(`No connected ${platform} account found for School ID ${schoolId}`);
    }

    // Check token expiry
    if (new Date() > new Date(account.token_expiry_date)) {
      await account.update({ connection_status: 'EXPIRED' });
      throw new Error(`Authentication token for ${platform} has expired. Please reconnect.`);
    }

    const provider = this.getProvider(platform);
    const postResult = await provider.publishPost(mediaUrl, caption, account.external_account_id);
    
    return postResult;
  }
}

module.exports = new SocialMediaService();
