const mongoose = require('mongoose');

const closedTestReportSchema = new mongoose.Schema(
    {
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Game',
            required: true,
        },
        recruitmentMethod: { type: String, default: '' },
        testerDifficulty: { type: String, default: '' },
        engagementSummary: { type: String, default: '' },
        feedbackSummary: { type: String, default: '' },
        intendedAudience: { type: String, default: '' },
        gameStandOut: { type: String, default: '' },
        installExpectation: { type: String, default: '' },
        productionImprovements: { type: String, default: '' },
        productionReadiness: { type: String, default: '' },
    },
    { timestamps: true }
);

const ClosedTestReport = mongoose.model('ClosedTestReport', closedTestReportSchema);
module.exports = ClosedTestReport;
