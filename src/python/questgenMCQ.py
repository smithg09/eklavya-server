from pprint import pprint
from Questgen import main
import sys

class QuestgenService :
    def __init__(self):
        self.qg = main.QGen()
        self.qe= main.BoolQGen()

    def generateMCQ(self, payload):
        data = self.qg.predict_mcq(payload)
        return data

    def generateBool(self, payload):
        data = self.qe.predict_boolq(payload)
        return data

    def generateShort(self, payload) :
        data = self.qg.predict_shortq(payload)
        return data

    def generateAll(self, payload) :
        mcq = self.generateMCQ(payload)
        bool = self.generateBool(payload  )
        short = self.generateShort(payload)
        return { mcq , bool , short }

# payload = { "input_text": sys.argv[1] }
payload = { "input_text" : '''const payload = `Big data analytics helps organizations harness their data and use it to identify new opportunities. That, in turn, leads to smarter business moves, more efficient operations, higher profits and happier customers. In his report Big Data in Big Companies, IIA Director of Research Tom Davenport interviewed more than 50 businesses to understand how they used big data. He found they got value in the following ways:
      Cost reduction. Big data technologies such as Hadoop and cloud-based analytics bring significant cost advantages when it comes to storing large amounts of data – plus they can identify more efficient ways of doing business.
      Faster, better decision making. With the speed of Hadoop and in-memory analytics, combined with the ability to analyze new sources of data, businesses are able to analyze information immediately – and make decisions based on what they’ve learned.
      New products and services. With the ability to gauge customer needs and satisfaction through analytics comes the power to give customers what they want. Davenport points out that with big data analytics, more companies are creating new products to meet customers’ needs.`;'''}

QUESTGEN_INSTANCE = QuestgenService()

if(sys.argv[2] == 'mcq') :
    data = QUESTGEN_INSTANCE.generateMCQ(payload)
elif(sys.argv[2] == 'bool') :
    data = QUESTGEN_INSTANCE.generateBool(payload)
elif(sys.argv[2] == 'shortq') :
    data = QUESTGEN_INSTANCE.generateShort(payload)
else :
    data = QUESTGEN_INSTANCE.generateAll(payload)
pprint (data)
sys.stdout.flush()
