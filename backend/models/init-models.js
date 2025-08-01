var DataTypes = require("sequelize").DataTypes;
var _answerkey = require("./answerkey");
var _answersubmission = require("./answersubmission");
var _audio = require("./audio");
var _comment = require("./comment");
var _communitypost = require("./communitypost");
var _exercise = require("./exercise");
var _exercisesubmission = require("./exercisesubmission");
var _game = require("./game");
var _gamecontent = require("./gamecontent");
var _gameplay = require("./gameplay");
var _learningpath = require("./learningpath");
var _learningprogress = require("./learningprogress");
var _lesson = require("./lesson");
var _payment = require("./payment");
var _paymentmethod = require("./paymentmethod");
var _quiz = require("./quiz");
var _quizquestion = require("./quizquestion");
var _reaction = require("./reaction");
var _report = require("./report");
var _servicepackage = require("./servicepackage");
var _skilllesson = require("./skilllesson");
var _skillsubmission = require("./skillsubmission");
var _strengthweakness = require("./strengthweakness");
var _testattempt = require("./testattempt");
var _transaction = require("./transaction");
var _user = require("./user");
var _userservice = require("./userservice");
var _video = require("./video");
var _forum = require("./forum");
var _forummember = require("./forummember");
var _forumpost = require("./forumpost");
var _forumcomment = require("./forumcomment");
var _forumreaction = require("./forumreaction");
var _forumchallenge = require("./forumchallenge");
var _forumchallenge_submission = require("./forumchallenge_submission");
var _user_karma = require("./user_karma");
var _premium_subscription = require("./premium_subscription");
var _teacher_profile = require("./teacher_profile");
var _forumreport = require("./forumreport");

function initModels(sequelize) {
  var answerkey = _answerkey(sequelize, DataTypes);
  var answersubmission = _answersubmission(sequelize, DataTypes);
  var audio = _audio(sequelize, DataTypes);
  var comment = _comment(sequelize, DataTypes);
  var communitypost = _communitypost(sequelize, DataTypes);
  var exercise = _exercise(sequelize, DataTypes);
  var exercisesubmission = _exercisesubmission(sequelize, DataTypes);
  var game = _game(sequelize, DataTypes);
  var gamecontent = _gamecontent(sequelize, DataTypes);
  var gameplay = _gameplay(sequelize, DataTypes);
  var learningpath = _learningpath(sequelize, DataTypes);
  var learningprogress = _learningprogress(sequelize, DataTypes);
  var lesson = _lesson(sequelize, DataTypes);
  var payment = _payment(sequelize, DataTypes);
  var paymentmethod = _paymentmethod(sequelize, DataTypes);
  var quiz = _quiz(sequelize, DataTypes);
  var quizquestion = _quizquestion(sequelize, DataTypes);
  var reaction = _reaction(sequelize, DataTypes);
  var report = _report(sequelize, DataTypes);
  var servicepackage = _servicepackage(sequelize, DataTypes);
  var skilllesson = _skilllesson(sequelize, DataTypes);
  var skillsubmission = _skillsubmission(sequelize, DataTypes);
  var strengthweakness = _strengthweakness(sequelize, DataTypes);
  var testattempt = _testattempt(sequelize, DataTypes);
  var transaction = _transaction(sequelize, DataTypes);
  var user = _user(sequelize, DataTypes);
  var userservice = _userservice(sequelize, DataTypes);
  var video = _video(sequelize, DataTypes);
  var forum = _forum(sequelize, DataTypes);
  var forummember = _forummember(sequelize, DataTypes);
  var forumpost = _forumpost(sequelize, DataTypes);
  var forumcomment = _forumcomment(sequelize, DataTypes);
  var forumreaction = _forumreaction(sequelize, DataTypes);
  var forumchallenge = _forumchallenge(sequelize, DataTypes);
  var forumchallenge_submission = _forumchallenge_submission(sequelize, DataTypes);
  var user_karma = _user_karma(sequelize, DataTypes);
  var premium_subscription = _premium_subscription(sequelize, DataTypes);
  var teacher_profile = _teacher_profile(sequelize, DataTypes);
  var forumreport = _forumreport(sequelize, DataTypes);

  comment.belongsTo(communitypost, { as: "post", foreignKey: "post_id" });
  communitypost.hasMany(comment, { as: "comments", foreignKey: "post_id" });
  reaction.belongsTo(communitypost, { as: "post", foreignKey: "post_id" });
  communitypost.hasMany(reaction, { as: "reactions", foreignKey: "post_id" });
  report.belongsTo(communitypost, { as: "post", foreignKey: "post_id" });
  communitypost.hasMany(report, { as: "reports", foreignKey: "post_id" });
  exercisesubmission.belongsTo(exercise, { as: "exercise", foreignKey: "exercise_id" });
  exercise.hasMany(exercisesubmission, { as: "exercisesubmissions", foreignKey: "exercise_id" });
  gamecontent.belongsTo(game, { as: "game", foreignKey: "game_id" });
  game.hasMany(gamecontent, { as: "gamecontents", foreignKey: "game_id" });
  gameplay.belongsTo(game, { as: "game", foreignKey: "game_id" });
  game.hasMany(gameplay, { as: "gameplays", foreignKey: "game_id" });
  exercise.belongsTo(lesson, { as: "lesson", foreignKey: "lesson_id" });
  lesson.hasMany(exercise, { as: "exercises", foreignKey: "lesson_id" });
  learningprogress.belongsTo(lesson, { as: "lesson", foreignKey: "lesson_id" });
  lesson.hasMany(learningprogress, { as: "learningprogresses", foreignKey: "lesson_id" });
  transaction.belongsTo(payment, { as: "payment", foreignKey: "payment_id" });
  payment.hasMany(transaction, { as: "transactions", foreignKey: "payment_id" });
  quizquestion.belongsTo(quiz, { as: "quiz", foreignKey: "quiz_id" });
  quiz.hasMany(quizquestion, { as: "quizquestions", foreignKey: "quiz_id" });
  testattempt.belongsTo(quiz, { as: "quiz", foreignKey: "quiz_id" });
  quiz.hasMany(testattempt, { as: "testattempts", foreignKey: "quiz_id" });
  answerkey.belongsTo(quizquestion, { as: "question", foreignKey: "question_id" });
  quizquestion.hasMany(answerkey, { as: "answerkeys", foreignKey: "question_id" });
  answersubmission.belongsTo(quizquestion, { as: "question", foreignKey: "question_id" });
  quizquestion.hasMany(answersubmission, { as: "answersubmissions", foreignKey: "question_id" });
  payment.belongsTo(servicepackage, { as: "package", foreignKey: "package_id" });
  servicepackage.hasMany(payment, { as: "payments", foreignKey: "package_id" });
  userservice.belongsTo(servicepackage, { as: "package", foreignKey: "package_id" });
  servicepackage.hasMany(userservice, { as: "userservices", foreignKey: "package_id" });
  audio.belongsTo(skilllesson, { as: "skill", foreignKey: "skill_id" });
  skilllesson.hasMany(audio, { as: "audios", foreignKey: "skill_id" });
  exercise.belongsTo(skilllesson, { as: "skill", foreignKey: "skill_id" });
  skilllesson.hasMany(exercise, { as: "exercises", foreignKey: "skill_id" });
  learningprogress.belongsTo(skilllesson, { as: "skill", foreignKey: "skill_id" });
  skilllesson.hasMany(learningprogress, { as: "learningprogresses", foreignKey: "skill_id" });
  skillsubmission.belongsTo(skilllesson, { as: "skill", foreignKey: "skill_id" });
  skilllesson.hasMany(skillsubmission, { as: "skillsubmissions", foreignKey: "skill_id" });
  video.belongsTo(skilllesson, { as: "skill", foreignKey: "skill_id" });
  skilllesson.hasMany(video, { as: "videos", foreignKey: "skill_id" });
  answersubmission.belongsTo(testattempt, { as: "attempt", foreignKey: "attempt_id" });
  testattempt.hasMany(answersubmission, { as: "answersubmissions", foreignKey: "attempt_id" });
  comment.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(comment, { as: "comments", foreignKey: "user_id" });
  communitypost.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(communitypost, { as: "communityposts", foreignKey: "user_id" });
  exercisesubmission.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(exercisesubmission, { as: "exercisesubmissions", foreignKey: "user_id" });
  gameplay.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(gameplay, { as: "gameplays", foreignKey: "user_id" });
  learningpath.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(learningpath, { as: "learningpaths", foreignKey: "user_id" });
  learningprogress.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(learningprogress, { as: "learningprogresses", foreignKey: "user_id" });
  payment.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(payment, { as: "payments", foreignKey: "user_id" });
  quiz.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(quiz, { as: "quizzes", foreignKey: "user_id" });
  reaction.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(reaction, { as: "reactions", foreignKey: "user_id" });
  report.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(report, { as: "reports", foreignKey: "user_id" });
  skillsubmission.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(skillsubmission, { as: "skillsubmissions", foreignKey: "user_id" });
  strengthweakness.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(strengthweakness, { as: "strengthweaknesses", foreignKey: "user_id" });
  testattempt.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(testattempt, { as: "testattempts", foreignKey: "user_id" });
  transaction.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(transaction, { as: "transactions", foreignKey: "user_id" });
  userservice.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(userservice, { as: "userservices", foreignKey: "user_id" });

  // Forum associations
  forum.belongsTo(user, { as: "creator", foreignKey: "created_by" });
  user.hasMany(forum, { as: "forums", foreignKey: "created_by" });

  forummember.belongsTo(forum, { as: "forum", foreignKey: "forum_id" });
  forum.hasMany(forummember, { as: "members", foreignKey: "forum_id" });

  forummember.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(forummember, { as: "forummemberships", foreignKey: "user_id" });

  forumpost.belongsTo(forum, { as: "forum", foreignKey: "forum_id" });
  forum.hasMany(forumpost, { as: "posts", foreignKey: "forum_id" });

  forumpost.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(forumpost, { as: "forumposts", foreignKey: "user_id" });

  // Forum associations
  forumcomment.belongsTo(forumpost, { as: "post", foreignKey: "post_id" });
  forumpost.hasMany(forumcomment, { as: "comments", foreignKey: "post_id" });

  forumreaction.belongsTo(forumpost, { as: "post", foreignKey: "post_id" });
  forumpost.hasMany(forumreaction, { as: "reactions", foreignKey: "post_id" });

  forumcomment.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(forumcomment, { as: "forumcomments", foreignKey: "user_id" });

  forumreaction.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(forumreaction, { as: "forumreactions", foreignKey: "user_id" });

  // New forum associations
  forumchallenge.belongsTo(forum, { as: "forum", foreignKey: "forum_id" });
  forum.hasMany(forumchallenge, { as: "challenges", foreignKey: "forum_id" });

  forumchallenge.belongsTo(user, { as: "creator", foreignKey: "created_by" });
  user.hasMany(forumchallenge, { as: "created_challenges", foreignKey: "created_by" });

  forumchallenge_submission.belongsTo(forumchallenge, { as: "challenge", foreignKey: "challenge_id" });
  forumchallenge.hasMany(forumchallenge_submission, { as: "submissions", foreignKey: "challenge_id" });

  forumchallenge_submission.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(forumchallenge_submission, { as: "challenge_submissions", foreignKey: "user_id" });

  user_karma.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasOne(user_karma, { as: "karma", foreignKey: "user_id" });

  premium_subscription.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasMany(premium_subscription, { as: "subscriptions", foreignKey: "user_id" });

  teacher_profile.belongsTo(user, { as: "user", foreignKey: "user_id" });
  user.hasOne(teacher_profile, { as: "teacher_profile", foreignKey: "user_id" });

  forumreport.belongsTo(user, { as: "reporter", foreignKey: "reporter_id" });
  user.hasMany(forumreport, { as: "reports_made", foreignKey: "reporter_id" });

  forumreport.belongsTo(user, { as: "reported_user", foreignKey: "user_id" });
  user.hasMany(forumreport, { as: "reports_received", foreignKey: "user_id" });

  forumreport.belongsTo(user, { as: "reviewer", foreignKey: "reviewed_by" });
  user.hasMany(forumreport, { as: "reports_reviewed", foreignKey: "reviewed_by" });

  forumreport.belongsTo(forumpost, { as: "post", foreignKey: "post_id" });
  forumpost.hasMany(forumreport, { as: "reports", foreignKey: "post_id" });

  forumreport.belongsTo(forumcomment, { as: "comment", foreignKey: "comment_id" });
  forumcomment.hasMany(forumreport, { as: "reports", foreignKey: "comment_id" });

  // Forum comment parent-child relationship
  forumcomment.belongsTo(forumcomment, { as: "parent", foreignKey: "parent_comment_id" });
  forumcomment.hasMany(forumcomment, { as: "replies", foreignKey: "parent_comment_id" });

  // Forum reaction can be on post or comment
  forumreaction.belongsTo(forumcomment, { as: "comment", foreignKey: "comment_id" });
  forumcomment.hasMany(forumreaction, { as: "reactions", foreignKey: "comment_id" });

  return {
    answerkey,
    answersubmission,
    audio,
    comment,
    communitypost,
    exercise,
    exercisesubmission,
    game,
    gamecontent,
    gameplay,
    learningpath,
    learningprogress,
    lesson,
    payment,
    paymentmethod,
    quiz,
    quizquestion,
    reaction,
    report,
    servicepackage,
    skilllesson,
    skillsubmission,
    strengthweakness,
    testattempt,
    transaction,
    user,
    userservice,
    video,
    forum,
    forummember,
    forumpost,
    forumcomment,
    forumreaction,
    forumchallenge,
    forumchallenge_submission,
    user_karma,
    premium_subscription,
    teacher_profile,
    forumreport,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
