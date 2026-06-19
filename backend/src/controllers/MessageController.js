const { Conversation, ConversationParticipant, Message, User, RegionalAdminScope, State } = require('../models');
const { Op } = require('sequelize');

class MessageController {
  async getConversations(req, res) {
    try {
      const myUserId = req.user.id;
      
      // Find all conversations where the user is a participant
      const participations = await ConversationParticipant.findAll({
        where: { user_id: myUserId }
      });
      const conversationIds = participations.map(p => p.conversation_id);
      
      const conversations = await Conversation.findAll({
        where: { id: conversationIds },
        order: [['created_at', 'DESC']]
      });

      const result = [];
      for (const conv of conversations) {
        // Find other participants
        const otherParticipantRecord = await ConversationParticipant.findOne({
          where: {
            conversation_id: conv.id,
            user_id: { [Op.ne]: myUserId }
          }
        });

        let otherUser = null;
        let stateName = 'N/A';
        if (otherParticipantRecord) {
          otherUser = await User.findByPk(otherParticipantRecord.user_id, {
            include: [{
              model: RegionalAdminScope,
              include: [{ model: State }]
            }]
          });
          if (otherUser) {
            stateName = otherUser.RegionalAdminScopes?.[0]?.State?.state_name || 'N/A';
          }
        }

        // Find last message
        const lastMsg = await Message.findOne({
          where: { conversation_id: conv.id },
          order: [['sent_at', 'DESC']]
        });

        result.push({
          id: conv.id,
          name: otherUser ? `${otherUser.first_name} ${otherUser.last_name || ''}`.trim() : 'System/Broadcast',
          email: otherUser?.email || '',
          stateName,
          status: otherUser?.status || 'ACTIVE',
          preview: lastMsg ? lastMsg.message_text : 'No messages yet',
          time: lastMsg ? lastMsg.sent_at : conv.created_at,
          initials: otherUser ? `${otherUser.first_name?.[0] || ''}${otherUser.last_name?.[0] || ''}`.toUpperCase() : 'B',
        });
      }

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch conversations', errors: [error.message] });
    }
  }

  async getOrCreateConversation(req, res) {
    try {
      const myUserId = req.user.id;
      const { recipientId } = req.body;
      if (!recipientId) {
        return res.status(400).json({ success: false, message: 'recipientId is required' });
      }

      const sequelize = require('../config/database');

      // Check if conversation already exists between these two users
      const query = `
        SELECT conversation_id 
        FROM conversation_participants 
        WHERE user_id IN (:myUserId, :recipientId)
        GROUP BY conversation_id
        HAVING COUNT(DISTINCT user_id) = 2
      `;
      const [existing] = await sequelize.query(query, {
        replacements: { myUserId, recipientId },
        type: sequelize.QueryTypes.SELECT
      });

      let conversationId;
      if (existing && existing.conversation_id) {
        conversationId = existing.conversation_id;
      } else {
        const transaction = await sequelize.transaction();
        try {
          const conv = await Conversation.create({
            conversation_code: `CONV-${Date.now()}`,
            created_by: myUserId
          }, { transaction });
          
          await ConversationParticipant.create({
            conversation_id: conv.id,
            user_id: myUserId
          }, { transaction });

          await ConversationParticipant.create({
            conversation_id: conv.id,
            user_id: recipientId
          }, { transaction });

          await transaction.commit();
          conversationId = conv.id;
        } catch (err) {
          await transaction.rollback();
          throw err;
        }
      }

      return res.status(200).json({ success: true, data: { conversationId } });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to create conversation', errors: [error.message] });
    }
  }

  async getMessages(req, res) {
    try {
      const { conversationId } = req.params;
      const messages = await Message.findAll({
        where: { conversation_id: conversationId },
        order: [['sent_at', 'ASC']]
      });

      const myUserId = req.user.id;
      const formatted = messages.map(m => ({
        from: m.sender_id === myUserId ? 'me' : 'them',
        text: m.message_text,
        time: new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));

      return res.status(200).json({ success: true, data: formatted });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch messages', errors: [error.message] });
    }
  }

  async sendMessage(req, res) {
    try {
      const myUserId = req.user.id;
      const { conversationId, text } = req.body;
      if (!conversationId || !text) {
        return res.status(400).json({ success: false, message: 'conversationId and text are required' });
      }

      const msg = await Message.create({
        conversation_id: conversationId,
        sender_id: myUserId,
        message_text: text,
        sent_at: new Date()
      });

      return res.status(201).json({ success: true, data: msg });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to send message', errors: [error.message] });
    }
  }

  async getChatContacts(req, res) {
    try {
      const myUserId = req.user.id;
      const roles = req.user.rolesList;
      const { User, Role, RegionalAdminScope, SchoolAdminMapping, School, District, State } = require('../models');

      let contacts = [];

      if (roles.includes('SUPER_ADMIN')) {
        // Super Admin can chat with all Regional Admins
        const regionalAdmins = await User.findAll({
          include: [{
            model: Role,
            where: { role_name: 'REGIONAL_ADMIN' },
            required: true
          }, {
            model: RegionalAdminScope,
            include: [{ model: State }]
          }]
        });
        contacts = regionalAdmins.map(u => {
          const scope = u.RegionalAdminScopes?.[0];
          return {
            id: u.id,
            name: `${u.first_name} ${u.last_name || ''}`.trim(),
            email: u.email,
            role: 'Regional Admin',
            stateName: scope?.State?.state_name || 'N/A',
            initials: `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase()
          };
        });
      } else if (roles.includes('REGIONAL_ADMIN')) {
        // Regional Admin can chat with all Super Admins
        const superAdmins = await User.findAll({
          include: [{
            model: Role,
            where: { role_name: 'SUPER_ADMIN' },
            required: true
          }]
        });
        superAdmins.forEach(u => {
          contacts.push({
            id: u.id,
            name: `${u.first_name} ${u.last_name || ''}`.trim(),
            email: u.email,
            role: 'Super Admin',
            stateName: 'National',
            initials: `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase()
          });
        });

        // And School Admins within their scoped states
        const stateIds = req.user.scope.stateIds || [];
        if (stateIds.length > 0) {
          const schoolAdminMappings = await SchoolAdminMapping.findAll({
            include: [{
              model: School,
              required: true,
              include: [{
                model: District,
                where: { state_id: stateIds },
                required: true,
                include: [State]
              }]
            }, {
              model: User,
              required: true
            }]
          });

          schoolAdminMappings.forEach(m => {
            const u = m.User;
            if (u && u.id !== myUserId) {
              contacts.push({
                id: u.id,
                name: `${u.first_name} ${u.last_name || ''}`.trim(),
                email: u.email,
                role: 'School Admin',
                stateName: m.School?.District?.State?.state_name || 'N/A',
                schoolName: m.School?.school_name || 'N/A',
                initials: `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase()
              });
            }
          });
        }
      } else if (roles.includes('SCHOOL_ADMIN')) {
        // School Admin can chat with all Super Admins
        const superAdmins = await User.findAll({
          include: [{
            model: Role,
            where: { role_name: 'SUPER_ADMIN' },
            required: true
          }]
        });
        superAdmins.forEach(u => {
          contacts.push({
            id: u.id,
            name: `${u.first_name} ${u.last_name || ''}`.trim(),
            email: u.email,
            role: 'Super Admin',
            stateName: 'National',
            initials: `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase()
          });
        });

        // And their State's Regional Admins
        const schoolId = req.user.scope.schoolId;
        if (schoolId) {
          const school = await School.findByPk(schoolId, {
            include: [{
              model: District,
              required: true
            }]
          });

          if (school && school.District) {
            const stateId = school.District.state_id;
            const regionalScopes = await RegionalAdminScope.findAll({
              where: { state_id: stateId },
              include: [{
                model: User,
                required: true
              }, {
                model: State
              }]
            });

            regionalScopes.forEach(s => {
              const u = s.User;
              if (u) {
                contacts.push({
                  id: u.id,
                  name: `${u.first_name} ${u.last_name || ''}`.trim(),
                  email: u.email,
                  role: 'Regional Admin',
                  stateName: s.State?.state_name || 'N/A',
                  initials: `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase()
                });
              }
            });
          }
        }
      }

      // Filter out duplicates
      const uniqueContacts = [];
      const seen = new Set();
      contacts.forEach(c => {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          uniqueContacts.push(c);
        }
      });

      return res.status(200).json({ success: true, data: uniqueContacts });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch chat contacts', errors: [error.message] });
    }
  }
}

module.exports = new MessageController();
