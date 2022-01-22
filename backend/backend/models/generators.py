from main import db

class generators(db.Model):
    __tablename__ = "generators"
    id = db.Column(db.Integer,  primary_key=True)
    serach_word = db.Column(db.Text)
    images = db.relationship("images")
    def __init__(self, provider, serach_word):
        self.serach_word = serach_word
