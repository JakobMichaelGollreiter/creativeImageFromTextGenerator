# Determine if we are running in production or development setup
import os

if "PRODUCTION" in os.environ and os.environ["PRODUCTION"]: #This is not security by default... might be improved.
	production = True
else:
	production = False
	print("Running in a DEVELOPEMENT Mode. This has major security implications! DO NOT USE for production!")