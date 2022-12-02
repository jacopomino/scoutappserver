import mongoose from "mongoose"

const GiocatoriSchema = new mongoose.Schema({
    data: {
        type: Array,
        required: true,
   },
    nome: {
    type: String,
    required: true,
  },
    club: {
    type: String,
    required: true,
  },
    logo: {
    type: String,
    required: true,
  },
    infos: {
    type: Object,
    required: true,
  },
    valore: {
    type: Array,
    required: true,
  },
    immagine: {
    type: String,
    required: true,
  },
    statistiche: {
    type: Object,
    required: true,
  },
    video: {
    type: String,
    required: false,
  },
});

const GiocatoriModel = mongoose.model("calcio", GiocatoriSchema);

module.exports = GiocatoriModel;