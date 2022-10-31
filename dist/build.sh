npm run build:prod

if [ "$?" -eq "0" ]
then
mv ./bgsp-ui/assets/center ./bgsp-ui/center
else
   echo "Failure."
fi
