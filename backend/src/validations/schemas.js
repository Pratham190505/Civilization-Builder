const { z } = require('zod');

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/\d/, 'Password must include a number');

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

const signupSchema = z.object({
  body: z.object({
    full_name: z.string().trim().min(2, 'Full name is required').max(255),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    mobile: z.string().trim().min(7, 'Mobile number is required').max(20),
    password: passwordSchema,
    confirm_password: z.string()
  }).refine(data => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password']
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string()
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
});

const resetPasswordSchema = z.object({
  body: z.object({
    password: passwordSchema,
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
});

const regionalAdminSchema = z.object({
  body: z.object({
    full_name: z.string().trim().min(2, 'Full name is required').max(255),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    mobile: z.string().trim().min(7, 'Mobile number is required').max(20),
    stateId: z.number().int().positive('Assigned state is required'),
    password: passwordSchema,
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
});

const impersonateSchema = z.object({
  body: z.object({
    userId: z.number().int().positive('Invalid target user ID')
  })
});

const stateInputSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  state_name: z.string().optional(),
  state_code: z.string().optional(),
  is_active: z.number().int().min(0).max(1).optional()
}).transform((data) => ({
  name: (data.name ?? data.state_name ?? '').trim(),
  code: (data.code ?? data.state_code ?? '').trim().toUpperCase(),
  ...(data.is_active !== undefined ? { is_active: data.is_active } : {})
})).pipe(z.object({
  name: z.string().min(2, 'State name is required').max(255),
  code: z.string().min(2, 'State code is required').max(255),
  is_active: z.number().int().min(0).max(1).optional()
}));

const stateSchema = z.object({
  body: stateInputSchema
});

const districtSchema = z.object({
  body: z.object({
    state_id: z.number().int().positive(),
    name: z.string().min(2).optional(),
    code: z.string().min(2).optional(),
    district_name: z.string().min(2).optional(),
    district_code: z.string().min(2).optional(),
    is_active: z.number().int().optional()
  }).refine(data => (data.name && data.code) || (data.district_name && data.district_code), {
    message: 'District name and code are required',
    path: ['district_name']
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
    website: z.string().url('Invalid website URL').optional(),
    udise_code: z.string().optional(),
    principal_name: z.string().optional(),
    student_count: z.number().int().nonnegative().optional(),
    teacher_count: z.number().int().nonnegative().optional(),
    school_admin_email: z.string().trim().toLowerCase().email('Invalid school admin email'),
    school_admin_password: passwordSchema,
    confirm_password: z.string()
  }).refine(data => data.school_admin_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password']
  })
});

const onboardingReviewSchema = z.object({
  body: z.object({
    comments: z.string().optional()
  })
});

const activitySchema = z.object({
  body: z.object({
    school_id: z.number().int().positive().optional(),
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
  signupSchema,
  changePasswordSchema,
  resetPasswordSchema,
  regionalAdminSchema,
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
