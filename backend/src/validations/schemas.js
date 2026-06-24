const { z } = require('zod');

// Authentication schemas
const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
});

const impersonateSchema = z.object({
  body: z.object({
    userId: z.coerce.number().int().positive('Invalid target user ID')
  })
});

const resetPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, 'Password must be at least 6 characters')
  })
});

// State, District, School schemas
const stateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').optional(),
    state_name: z.string().min(2, 'State name is required').optional(),
    code: z.string().min(2, 'Code is required').optional(),
    state_code: z.string().min(2, 'State code is required').optional(),
    is_active: z.coerce.number().int().min(0).max(1).optional()
  }).refine(data => (data.name || data.state_name || data.is_active !== undefined) && (data.code || data.state_code || data.is_active !== undefined), {
    message: "State name and code are required",
    path: ["body"]
  })
});

const districtSchema = z.object({
  body: z.object({
    state_id: z.coerce.number().int().positive().optional(),
    name: z.string().min(2).optional(),
    district_name: z.string().min(2).optional(),
    code: z.string().min(2).optional(),
    district_code: z.string().min(2).optional(),
    is_active: z.coerce.number().int().min(0).max(1).optional()
  }).refine(data => (data.name || data.district_name || data.is_active !== undefined) && (data.code || data.district_code || data.is_active !== undefined), {
    message: "District name and code are required",
    path: ["body"]
  })
});

const schoolSchema = z.object({
  params: z.object({
    id: z.string().optional()
  }).optional(),
  body: z.object({
    district_id: z.coerce.number().int().positive().optional(),
    name: z.string().min(2).optional(),
    school_name: z.string().min(2).optional(),
    code: z.string().min(2).optional(),
    school_code: z.string().min(2).optional(),
    school_type: z.string().optional().nullable(),
    affiliation_board: z.string().optional().nullable(),
    email: z.string().optional().nullable().or(z.literal('')),
    mobile: z.string().optional().nullable().or(z.literal('')),
    phone: z.string().optional().nullable().or(z.literal('')),
    alternate_mobile: z.string().optional().nullable().or(z.literal('')),
    website: z.string().optional().nullable().or(z.literal('')),
    establishment_year: z.coerce.number().optional().nullable(),
    logo_url: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    taluka: z.string().optional().nullable(),
    pin_code: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    
    // Principal
    principal_name: z.string().optional().nullable(),
    principal_qualification: z.string().optional().nullable(),
    principal_email: z.string().optional().nullable().or(z.literal('')),
    principal_mobile: z.string().optional().nullable().or(z.literal('')),
    
    // Admin Account details
    admin_name: z.string().optional().nullable(),
    admin_email: z.string().optional().nullable().or(z.literal('')),
    admin_mobile: z.string().optional().nullable().or(z.literal('')),
    admin_password: z.string().optional().nullable(),
    
    // Strength
    student_count: z.coerce.number().int().nonnegative().optional().nullable(),
    boys_count: z.coerce.number().int().nonnegative().optional().nullable(),
    girls_count: z.coerce.number().int().nonnegative().optional().nullable(),
    teacher_count: z.coerce.number().int().nonnegative().optional().nullable(),
    male_teachers_count: z.coerce.number().int().nonnegative().optional().nullable(),
    female_teachers_count: z.coerce.number().int().nonnegative().optional().nullable(),
    non_teaching_staff_count: z.coerce.number().int().nonnegative().optional().nullable(),
    
    // Infrastructure
    classrooms_count: z.coerce.number().int().nonnegative().optional().nullable(),
    labs_count: z.coerce.number().int().nonnegative().optional().nullable(),
    computer_labs_count: z.coerce.number().int().nonnegative().optional().nullable(),
    library_available: z.any().optional().nullable(),
    playground_available: z.any().optional().nullable(),
    smart_classrooms_count: z.coerce.number().int().nonnegative().optional().nullable(),
    auditorium_available: z.any().optional().nullable(),
    transport_available: z.any().optional().nullable(),
    
    // Additional Details
    description: z.string().optional().nullable(),
    achievements: z.string().optional().nullable(),
    facebook_url: z.string().refine(val => !val || /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.com)\/.+$/i.test(val), {
      message: "Must be a valid Facebook URL"
    }).optional().nullable().or(z.literal('')),
    instagram_url: z.string().refine(val => !val || /^(https?:\/\/)?(www\.)?instagram\.com\/.+$/i.test(val), {
      message: "Must be a valid Instagram URL"
    }).optional().nullable().or(z.literal('')),
    youtube_url: z.string().refine(val => !val || /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(val), {
      message: "Must be a valid YouTube URL"
    }).optional().nullable().or(z.literal('')),
    website_url: z.string().refine(val => !val || /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/i.test(val), {
      message: "Must be a valid URL"
    }).optional().nullable().or(z.literal('')),
    notes: z.string().optional().nullable(),
    academic_score: z.coerce.number().int().min(0).max(300).optional(),
    achievement_score: z.coerce.number().int().min(0).max(300).optional(),
    media_score: z.coerce.number().int().min(0).max(300).optional(),
    participation_score: z.coerce.number().int().min(0).max(100).optional()
  })
}).superRefine(async (data, ctx) => {
  const schoolId = data.params?.id;
  if (schoolId) {
    try {
      const { School } = require('../models');
      const school = await School.findByPk(schoolId);
      if (school && school.inspection_status === 'COMPLETED' && school.tier_id !== null) {
        const facebook = data.body.facebook_url !== undefined ? data.body.facebook_url : school.facebook_url;
        const instagram = data.body.instagram_url !== undefined ? data.body.instagram_url : school.instagram_url;
        const youtube = data.body.youtube_url !== undefined ? data.body.youtube_url : school.youtube_url;

        if (!facebook) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Facebook URL is required after ranking",
            path: ["body", "facebook_url"]
          });
        }
        if (!instagram) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Instagram URL is required after ranking",
            path: ["body", "instagram_url"]
          });
        }
        if (!youtube) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "YouTube URL is required after ranking",
            path: ["body", "youtube_url"]
          });
        }
      }
    } catch (err) {
      console.error("Zod async refine DB error:", err);
    }
  }
});

const onboardingReviewSchema = z.object({
  body: z.object({
    comments: z.string().optional()
  })
});

const regionalAdminSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    first_name: z.string().min(2, 'First name is required'),
    last_name: z.string().optional(),
    mobile: z.string().optional(),
    stateId: z.coerce.number().int().positive('Invalid state ID')
  })
});

// Activities & Achievements schemas
const activitySchema = z.object({
  body: z.object({
    school_id: z.coerce.number().int().positive().optional(), // optional if inferred from School Admin scope
    category_id: z.coerce.number().int().positive(),
    title: z.string().min(3),
    description: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional()
  })
});

const achievementSchema = z.object({
  body: z.object({
    school_id: z.coerce.number().int().positive().optional(),
    title: z.string().min(3),
    description: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    level: z.enum(['DISTRICT', 'STATE', 'NATIONAL', 'INTERNATIONAL'])
  })
});

// Media schemas
const mediaSubmitSchema = z.object({
  body: z.object({
    media_asset_id: z.coerce.number().int().positive(),
    title: z.string().min(3),
    description: z.string().optional()
  })
});

const mediaReviewSchema = z.object({
  body: z.object({
    submission_id: z.coerce.number().int().positive(),
    action: z.enum(['APPROVE', 'REJECT', 'REQUEST_CHANGES']),
    comments: z.string().optional()
  })
});

const mediaApproveRejectSchema = z.object({
  body: z.object({
    submission_id: z.coerce.number().int().positive(),
    comments: z.string().optional(),
    is_featured: z.boolean().optional()
  })
});

const mediaPublishSchema = z.object({
  body: z.object({
    submission_id: z.coerce.number().int().positive(),
    platforms: z.array(z.enum(['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'YOUTUBE'])).min(1, 'Select at least one platform')
  })
});

// Inspections schemas
const inspectionRequestSchema = z.object({
  body: z.object({
    school_id: z.coerce.number().int().positive().optional(),
    comments: z.string().optional(),
    preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD format').optional()
  })
});

const inspectionScheduleSchema = z.object({
  body: z.object({
    requestId: z.coerce.number().int().positive(),
    inspectorId: z.coerce.number().int().positive(),
    scheduleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD format')
  })
});

const inspectionCompleteSchema = z.object({
  body: z.object({
    reportId: z.coerce.number().int().positive(),
    academic_score: z.coerce.number().int().min(0).max(300, 'Academic score must be between 0 and 300'),
    achievement_score: z.coerce.number().int().min(0).max(300, 'Achievement score must be between 0 and 300'),
    media_score: z.coerce.number().int().min(0).max(300, 'Media score must be between 0 and 300'),
    participation_score: z.coerce.number().int().min(0).max(100, 'Participation score must be between 0 and 100'),
    feedback: z.string().min(10, 'Provide at least 10 characters of feedback')
  })
});

// Recommendations schemas
const recommendationSchema = z.object({
  body: z.object({
    school_id: z.coerce.number().int().positive(),
    type: z.string().min(3),
    description: z.string().min(5),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW'])
  })
});

module.exports = {
  loginSchema,
  refreshSchema,
  impersonateSchema,
  resetPasswordSchema,
  stateSchema,
  districtSchema,
  schoolSchema,
  onboardingReviewSchema,
  regionalAdminSchema,
  activitySchema,
  achievementSchema,
  mediaSubmitSchema,
  mediaReviewSchema,
  mediaApproveRejectSchema,
  mediaPublishSchema,
  inspectionRequestSchema,
  inspectionScheduleSchema,
  inspectionCompleteSchema,
  recommendationSchema
};

