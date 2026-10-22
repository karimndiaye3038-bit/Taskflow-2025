const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Le nom est obligatoire'], trim: true, minlength: [2, 'Le nom doit avoir au moins 2 caractères'] },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Format d'email invalide"],
    },
    password: { type: String, required: true, select: false }, // jamais renvoyé par défaut
    role: { type: String, enum: ['ADMIN', 'USER'], default: 'USER' },
  },
  { timestamps: true }
);

// Sécurité : on retire le mot de passe de toutes les réponses JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
