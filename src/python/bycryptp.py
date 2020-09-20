import bcrypt
import sys

password = b"smith"
# Hash a password for the first time, with a certain number of rounds
hashed = bcrypt.hashpw(password, bcrypt.gensalt(14))
# Check that a unhashed password matches one that has previously been
#   hashed
if bcrypt.checkpw(password, hashed):
  print("It Matches!")
  sys.stdout.flush()
else:
  print("It Does not Match :(")
  sys.stdout.flush()
