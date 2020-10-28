FROM python:3.7-slim

# Create app directory
WORKDIR /app

# Install app dependencies
COPY requirements.txt ./

RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN pip install gunicorn

# Bundle app source
COPY . ./

ENV PORT=5000
EXPOSE ${PORT}
# Run the app
CMD ["gunicorn", "run:app"]