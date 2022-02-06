from main import db

class generators(db.Model):
    __tablename__ = "generators"
    id = db.Column(db.Integer,  primary_key=True)
    search = db.Column(db.Text)
    images = db.relationship("images", back_populates="generator")
    def __init__(self, search):
        self.search = search
