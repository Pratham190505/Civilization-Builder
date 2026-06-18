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
    userId: z.number().int().positive('Invalid target user ID')
  })
});

// State, District, School schemas
const stateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required'),
    code: z.string().min(2, 'Code is required')
  })
});

const districtSchema = z.object({
  body: z.object({
    state_id: z.number().int().positive(),
    name: z.string().min(2),
    code: z.string().min(2)
  })
});

const schoolSchema = z.object({
  body: z.object({
    district_id: z.number().int().positive(),
    name: z.string().min(2),
    code: z.string().min(2),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional(),
    website: z.string().url('Invalid website URL').optional()
  })
});

const onboardingReviewSchema = z.object({
  body: z.object({
    comments: z.string().optional()
  })
});

// Activities & Achievements schemas
const activitySchema = z.object({
  body: z.object({
    school_id: z.number().int().positive().optional(), // optional if inferred from School Admin scope
    category_id: z.number().int().positive(),
    title: z.string().min(3),
    description: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional()
  })
});

const achievementSchema = z.object({
  body: z.object({
    school_id: z.number().int().positive().optional(),
    title: z.string().min(3),
    description: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    level: z.enum(['DISTRICT', 'STATE', 'NATIONAL', 'INTERNATIONAL'])
  })
});

// Media schemas
const mediaSubmitSchema = z.object({
  body: z.object({
    media_asset_id: z.number().int().positive(),
    title: z.string().min(3),
    description: z.string().optional()
  })
});

const mediaReviewSchema = z.object({
  body: z.object({
    submission_id: z.number().int().positive(),
    action: z.enum(['APPROVE', 'REJECT', 'REQUEST_CHANGES']),
    comments: z.string().optional()
  })
});

const mediaApproveRejectSchema = z.object({
  body: z.object({
    submission_id: z.number().int().positive(),
    comments: z.string().optional()
  })
});

const mediaPublishSchema = z.object({
  body: z.object({
    submission_id: z.number().int().positive(),
    platforms: z.array(z.enum(['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'YOUTUBE'])).min(1, 'Select at least one platform')
  })
});

// Inspections schemas
const inspectionRequestSchema = z.object({
  body: z.object({
    school_id: z.number().int().positive().optional(),
    comments: z.string().optional(),
    preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD format').optional()
  })
});

const inspectionScheduleSchema = z.object({
  body: z.object({
    requestId: z.number().int().positive(),
    inspectorId: z.number().int().positive(),
    scheduleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD format')
  })
});

const inspectionCompleteSchema = z.object({
  body: z.object({
    reportId: z.number().int().positive(),
    score: z.number().int().min(0).max(100, 'Score must be between 0 and 100'),
    feedback: z.string().min(10, 'Provide at least 10 characters of feedback')
  })
});

// Recommendations schemas
const recommendationSchema = z.object({
  body: z.object({
    school_id: z.number().int().positive(),
    type: z.string().min(3),
    description: z.string().min(5),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW'])
  })
});

module.exports = {
  loginSchema,
  refreshSchema,
  impersonateSchema,
  stateSchema,
  districtSchema,
  schoolSchema,
  onboardingReviewSchema,
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
